/**
 * Inner Harmony - Lead Capture & Guide Delivery Web App
 * 
 * Handles POST requests from the website lead capture form,
 * records submission in Google Sheet, and emails the PDF guide(s)
 * with updated contact details (phone + email signature).
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var name = (data.name || '').trim();
    var email = (data.email || '').trim();
    var phone = (data.phone || '').trim();
    var timestamp = new Date();

    var archetypesList = data.archetypes || (data.archetype ? [data.archetype] : ['Assessment Guide']);
    var pdfUrls = data.pdfUrls || (data.pdfUrl ? [data.pdfUrl] : []);

    // 1. Record lead in Google Sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var archetypesString = archetypesList.join(', ');
    sheet.appendRow([timestamp, name, email, phone, archetypesString, data.pdfUrl || '']);

    // 2. Fetch PDF guide attachments if URLs provided
    var attachments = [];
    for (var i = 0; i < pdfUrls.length; i++) {
      try {
        var response = UrlFetchApp.fetch(pdfUrls[i], { muteHttpExceptions: true });
        if (response.getResponseCode() === 200) {
          var blob = response.getBlob();
          var guideName = archetypesList[i] || ('Guide-' + (i + 1));
          blob.setName(guideName + ' - Inner Harmony.pdf');
          attachments.push(blob);
        }
      } catch (fetchErr) {
        Logger.log('Could not fetch PDF: ' + pdfUrls[i] + ' - ' + fetchErr);
      }
    }

    // 3. Compose Email
    var guideSubject = archetypesList.length > 1
      ? 'Your Inner Harmony Healing Guides'
      : 'Your ' + archetypesList[0] + ' Healing Guide';

    var htmlBody = buildEmailHtml(name, archetypesList, pdfUrls);

    // 4. Send Email via Gmail
    GmailApp.sendEmail(email, guideSubject, '', {
      name: 'Dr. Gargee Gadgil | Inner Harmony',
      htmlBody: htmlBody,
      attachments: attachments
    });

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function buildEmailHtml(name, archetypesList, pdfUrls) {
  var guidesHtml = '';
  for (var i = 0; i < archetypesList.length; i++) {
    guidesHtml += '<li style="margin-bottom:6px;"><strong>' + archetypesList[i] + '</strong> Healing Guide</li>';
  }

  var downloadButtonsHtml = '';
  for (var j = 0; j < pdfUrls.length; j++) {
    downloadButtonsHtml += '<a href="' + pdfUrls[j] + '" style="display:inline-block;padding:10px 18px;margin:4px 6px 4px 0;background-color:#7c3d4a;color:#ffffff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">Download ' + (archetypesList[j] || 'Guide') + ' (PDF)</a> ';
  }

  return '<!DOCTYPE html>' +
    '<html><body style="font-family:Georgia, serif; color:#2c2523; line-height:1.6; max-width:600px; margin:0 auto; padding:24px 16px;">' +
    '<h2 style="color:#5c2434; font-family:Georgia, serif; font-size:22px; margin-top:0;">Hello ' + (name || 'Friend') + ',</h2>' +
    '<p style="font-size:15px; color:#4a3f35;">Thank you for completing the Inner Harmony assessment.</p>' +
    '<p style="font-size:15px; color:#4a3f35;">Your result revealed your primary archetype as <strong>' + archetypesList.join(', ') + '</strong>. We have attached your complete guide directly to this email.</p>' +
    
    '<div style="background-color:#f8f2eb; border-left:4px solid #7c3d4a; border-radius:4px; padding:16px 20px; margin:24px 0;">' +
      '<p style="margin:0 0 10px; font-weight:600; color:#5c2434;">✦ Your Healing Guides:</p>' +
      '<ul style="margin:0; padding-left:20px; color:#3a312d;">' + guidesHtml + '</ul>' +
    '</div>' +

    (downloadButtonsHtml ? '<p style="font-size:13px; color:#6b5f54; margin-bottom:8px;">You can also view / download your guides online anytime:</p><div style="margin-bottom:24px;">' + downloadButtonsHtml + '</div>' : '') +

    '<hr style="border:none; border-top:1px solid #e8ded4; margin:32px 0 20px;" />' +

    '<p style="margin:0 0 4px; font-size:15px; color:#4a3f35;">Warm regards,</p>' +
    '<p style="margin:0 0 2px; font-size:17px; font-weight:bold; color:#2b221a;">Dr. Gargee Gadgil</p>' +
    '<p style="margin:0 0 10px; font-size:13px; color:#7a6d5f; font-style:italic;">Founder, Inner Harmony</p>' +
    
    '<table cellpadding="0" cellspacing="0" border="0" style="font-size:13px; color:#5c4e43; line-height:1.8;">' +
      '<tr><td style="padding-right:8px;">🌐</td><td><a href="https://www.innerharmonywork.in" style="color:#7c3d4a; text-decoration:none; font-weight:600;">InnerHarmonyWork.in</a></td></tr>' +
      '<tr><td style="padding-right:8px;">✉️</td><td><a href="mailto:Innerharmonywork@gmail.com" style="color:#7c3d4a; text-decoration:none;">Innerharmonywork@gmail.com</a></td></tr>' +
      '<tr><td style="padding-right:8px;">💬</td><td><a href="https://wa.me/919152155022" style="color:#7c3d4a; text-decoration:none; font-weight:600;">+91 91521 55022</a> <span style="color:#8a7d72;">(WhatsApp / Call)</span></td></tr>' +
    '</table>' +

    '</body></html>';
}
