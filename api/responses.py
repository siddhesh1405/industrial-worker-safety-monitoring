"""
Common API response helpers.
"""


def success(data=None, message="Success"):
    return {
        "success": True,
        "message": message,
        "data": data
    }


def error(message):
    return {
        "success": False,
        "message": message
    }