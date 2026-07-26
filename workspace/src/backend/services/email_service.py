import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

def send_verification_email(to_email: str, code: str) -> bool:
    subject = "NutriScan AI — Email Verification Code"
    body = f"""
    Hello!

    Thank you for registering on NutriScan AI.
    Your 6-digit email verification code is:

    ======================
            {code}
    ======================

    This code is valid for 15 minutes. Enter it in the app to activate your account.

    Best regards,
    The NutriScan AI Team
    """
    return _dispatch_email(to_email, subject, body)

def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    reset_url = f"http://localhost:5173?reset_token={reset_token}"
    subject = "NutriScan AI — Password Reset Request"
    body = f"""
    Hello!

    We received a request to reset the password for your NutriScan AI account ({to_email}).

    Your Password Reset Code / Token is:
    {reset_token}

    Direct Reset Link:
    {reset_url}

    If you did not request a password reset, you can safely ignore this email.

    Best regards,
    The NutriScan AI Team
    """
    return _dispatch_email(to_email, subject, body)

def _dispatch_email(to_email: str, subject: str, body: str) -> bool:
    print(f"\n================ [EMAIL DISPATCH LOG] ================")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(body)
    print(f"======================================================\n")

    if not SMTP_USER or not SMTP_PASSWORD:
        # Development mode logger fallback
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"❌ Failed to send SMTP email: {e}")
        return False
