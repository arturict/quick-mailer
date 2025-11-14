# Email Attachment Feature - Testing Guide

This document provides a comprehensive testing guide for the email attachment feature.

## Prerequisites

1. Ensure the backend and frontend are running
2. Configure a valid email provider (Resend or SMTP)

## Test Cases

### 1. File Upload Component - Drag and Drop

**Test Steps:**
1. Navigate to the Email Composer
2. Locate the "Attachments (Optional)" section
3. Drag a valid image file (e.g., .jpg, .png) into the drop zone
4. Verify the file appears in the attached files list
5. Verify the file icon, name, and size are displayed correctly

**Expected Result:**
- File should be accepted and displayed in the list
- Correct icon should be shown based on file type
- File size should be formatted correctly (e.g., "1.5 MB")

### 2. File Upload Component - Click to Upload

**Test Steps:**
1. Click on the upload area
2. Select multiple files from the file picker dialog
3. Verify all files appear in the attached files list

**Expected Result:**
- File picker should open
- All selected files should be added to the list
- Each file should have a remove button

### 3. File Type Validation

**Test Steps:**
1. Try to upload an executable file (.exe) or script (.sh)
2. Verify an error message is displayed
3. Try to upload a valid PDF file
4. Verify it's accepted

**Expected Result:**
- Invalid file types should be rejected with clear error message
- Valid file types should be accepted
- Allowed types: images (jpg, png, gif, webp, svg), PDFs, Office documents (doc, docx, xls, xlsx, ppt, pptx), text files, CSV, ZIP

### 4. File Size Validation

**Test Steps:**
1. Try to upload a file larger than 10MB
2. Verify an error message is displayed
3. Try to upload a file smaller than 10MB
4. Verify it's accepted

**Expected Result:**
- Files larger than 10MB should be rejected with error message
- Files smaller than 10MB should be accepted

### 5. Remove Attachment

**Test Steps:**
1. Upload 2-3 files
2. Click the "X" button on one of the files
3. Verify the file is removed from the list

**Expected Result:**
- File should be removed from the list immediately
- Other files should remain in the list

### 6. Send Email with Attachments

**Test Steps:**
1. Fill in the email form (from, to, subject, message)
2. Upload 2-3 valid files
3. Click "Send Email"
4. Verify the success message is displayed
5. Navigate to Email History
6. Find the sent email
7. Verify the attachment indicator shows the correct count

**Expected Result:**
- Email should be sent successfully
- Attachments should be saved to the database
- Email history should show attachment count (e.g., "📎 3")

### 7. View Email with Attachments

**Test Steps:**
1. In Email History, click "View" on an email with attachments
2. Verify the attachments section is displayed
3. Verify each attachment shows correct icon, filename, and size
4. Click "Download" on an attachment
5. Verify the file downloads correctly

**Expected Result:**
- Attachments section should be visible in the email detail modal
- Each attachment should display properly
- Download button should download the correct file
- Downloaded file should be identical to the uploaded file

### 8. Send Email Without Attachments

**Test Steps:**
1. Fill in the email form
2. Do not add any attachments
3. Click "Send Email"
4. Verify the email is sent successfully

**Expected Result:**
- Email should send normally without attachments
- No errors should occur

### 9. Multiple File Upload

**Test Steps:**
1. Upload 5 different types of files (image, PDF, Word doc, Excel sheet, text file)
2. Verify all files are displayed with correct icons
3. Send the email
4. Verify all attachments are saved and downloadable

**Expected Result:**
- All file types should be handled correctly
- Correct icons should be displayed for each type
- All files should be downloadable from email history

### 10. Template Email with Attachments

**Test Steps:**
1. Select a template from the dropdown
2. Fill in template variables
3. Add attachments
4. Send the email
5. Verify attachments are included

**Expected Result:**
- Template and attachments should work together
- Email should be sent with both template content and attachments

## Security Test Cases

### 11. Path Traversal Prevention

**Test Steps:**
1. Try to upload a file named "../../etc/passwd"
2. Verify the filename is sanitized
3. Check the database to ensure the sanitized filename is stored

**Expected Result:**
- Filename should be sanitized (e.g., "____etc_passwd")
- No path traversal characters should remain

### 12. MIME Type Verification

**Test Steps:**
1. Rename a .txt file to .jpg
2. Try to upload it
3. Verify the system checks the actual MIME type, not just the extension

**Expected Result:**
- System should log a warning about MIME type mismatch
- File may be accepted based on actual MIME type validation

### 13. Maximum File Count

**Test Steps:**
1. Try to upload 10+ files
2. Verify all files can be uploaded
3. Send the email

**Expected Result:**
- Multiple files should be supported (no artificial limit on count)
- Only size limit (10MB per file) should apply

## Performance Test Cases

### 14. Large File Upload

**Test Steps:**
1. Upload a file close to the 10MB limit (e.g., 9.5MB)
2. Monitor the upload progress
3. Send the email
4. Monitor send time

**Expected Result:**
- File should upload successfully
- Email should send within reasonable time
- No timeout errors

### 15. Multiple Emails with Attachments

**Test Steps:**
1. Send 3-5 emails each with 2-3 attachments
2. Navigate to Email History
3. Verify all emails show correct attachment counts
4. View and download attachments from different emails

**Expected Result:**
- All emails should be stored correctly
- Attachments should be associated with correct emails
- No data corruption or mixing of attachments

## Browser Compatibility

### 16. Test in Different Browsers

**Test Steps:**
1. Test drag-and-drop in Chrome, Firefox, Safari, Edge
2. Test file picker in each browser
3. Test download functionality

**Expected Result:**
- Feature should work consistently across browsers
- UI should render correctly

## Edge Cases

### 17. Empty File

**Test Steps:**
1. Try to upload a 0-byte file
2. Verify handling

**Expected Result:**
- System should handle gracefully (accept or reject with clear message)

### 18. Special Characters in Filename

**Test Steps:**
1. Upload files with special characters in names (e.g., "file (1).pdf", "file#@!.txt")
2. Verify filename sanitization

**Expected Result:**
- Special characters should be handled safely
- Filenames should be sanitized appropriately

### 19. Unicode Filenames

**Test Steps:**
1. Upload files with Unicode characters in names (e.g., "文档.pdf", "Файл.doc")
2. Verify files are stored and downloadable

**Expected Result:**
- Unicode filenames should be preserved or safely sanitized
- Files should download with correct names

## Summary Checklist

- [ ] Drag-and-drop works correctly
- [ ] Click to upload works correctly
- [ ] File type validation works
- [ ] File size validation works (10MB limit)
- [ ] Remove attachment works
- [ ] Send email with attachments works
- [ ] View attachments in email history works
- [ ] Download attachments works
- [ ] Attachment icons display correctly
- [ ] Security validations prevent malicious uploads
- [ ] Multiple file types are supported
- [ ] Performance is acceptable with large files
- [ ] Browser compatibility is good
- [ ] Edge cases are handled gracefully
