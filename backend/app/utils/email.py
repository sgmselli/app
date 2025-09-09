from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from typing import Optional
import enum

from app.core import settings

class EmailTemplatesId(enum.Enum):
    PAYMENT_SUCCESS_TEMPLATE_ID = "d-22be8b6cfbf44476bf1c0a004b1937d2"

class EmailHandler:
    def __init__(self):
        self.sg = SendGridAPIClient(settings.send_grid_api_key)
        self.from_email = settings.from_email

    def send_payment_success_email(self, to_email: str, display_name: str, amount: str, currency: str):
        print(display_name, amount, currency)
        data = {
            "display_name": display_name,
            "amount": amount,
            "currency": currency
        }
        self.send_email(template_id=EmailTemplatesId.PAYMENT_SUCCESS_TEMPLATE_ID.value, to_email=to_email , data=data)

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
            print(response.status_code, response.body, response.headers)
        except Exception as e:
            print(e)

