"""
API routes.
"""

from flask import Blueprint

from api.responses import success
from api.services import service

api = Blueprint(
    "api",
    __name__,
)


@api.route("/health", methods=["GET"])
def health():

    return success(
        message="Industrial Worker Safety Monitoring API is running."
    )


@api.route("/workers", methods=["GET"])
def workers():

    data = service.get_live_data()

    return success(data)


@api.route("/events", methods=["GET"])
def events():

    data = service.get_event_history()

    return success(data)
