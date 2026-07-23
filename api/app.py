"""
Application entry point.
"""

from flask import Flask
from flask_cors import CORS

from api.routes import api
from api.live_engine import live_engine

def create_app():

    app = Flask(__name__)

    CORS(app)

    app.register_blueprint(
        api,
        url_prefix="/api"
    )

    live_engine.start()

    return app


app = create_app()


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )