from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from typing import Optional
import enum

from app.core import settings
from app.utils.logging import Logger, LogLevel

class EmailTemplatesId(enum.Enum):
    PAYMENT_SUCCESS_TO_SUPPORTER_TEMPLATE_ID = "d-22be8b6cfbf44476bf1c0a004b1937d2"
    PAYMENT_SUCCESS_TO_CREATOR_TEMPLATE_ID = "d-4fa394cb59684950a01f7dbf5b34e607"

class EmailHandler:
    def __init__(self):
        self.sg = SendGridAPIClient(settings.send_grid_api_key)
        self.from_email = settings.from_email

    def send_payment_success_to_supporter_email(self, to_email: str, display_name: str, amount: str, currency: str):
        data = {
            "display_name": display_name,
            "amount": amount,
            "currency": currency
        }
        self.send_email(template_id=EmailTemplatesId.PAYMENT_SUCCESS_TO_SUPPORTER_TEMPLATE_ID.value, to_email=to_email , data=data)

    def send_payment_success_to_creator_email(self, to_email: str, display_name: str, supporter_email: str, amount: str, currency: str):
        data = {
            "display_name": display_name,
            "supporter_email": supporter_email,
            "amount": amount,
            "currency": currency
        }
        self.send_email(template_id=EmailTemplatesId.PAYMENT_SUCCESS_TO_CREATOR_TEMPLATE_ID.value, to_email=to_email , data=data)

    def send_email(self, template_id: str, to_email: str, data: Optional[dict[str, str]] = None):
        message = Mail(
            from_email=self.from_email,
            to_emails=to_email
        )
        message.template_id = template_id
        if data:
            message.dynamic_template_data = data
        try:
            response = self.sg.send(message)
            Logger.log(LogLevel.INFO, f"status code: {response.status_code}, body: {response.body}, headers: {response.headers}")
        except Exception as e:
            Logger.log(LogLevel.ERROR, str(e))

