# TasksLists Backend

This is the backend component of the TasksLists application, which provides API services for task list management.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Configure your `.env` file based on the `.env.template` file.

5. Start the server:
   ```
   python main.py
   ```

## Email Verification

The application sends verification emails when users register. If you encounter issues with email sending:

1. **Gmail App Password**: Make sure your Gmail App Password is correctly set in the `.env` file. App Passwords are displayed with spaces (e.g., "abcd efgh ijkl mnop"), but the system will remove those spaces automatically.

2. **Finding Verification Codes**: If emails are not being sent, verification codes are logged to `email_logs.txt` in the `backend` directory. You can find your code there:
   ```
   python check_verification_code.py your_email@example.com
   ```

3. **Gmail Security**: If you're using Gmail, make sure:
   - 2-Step Verification is enabled on your Google account
   - You've generated an App Password specifically for this application
   - Your account doesn't have any security restrictions that block SMTP access

## Troubleshooting

If you encounter issues with email sending, you can test your SMTP configuration:
```
python test_gmail.py
```

This will attempt to connect to your SMTP server and send a test email. 