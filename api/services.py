"""
Application service layer.
"""

from api.live_engine import live_engine


class WorkerSafetyService:

    def get_live_data(self):

        return live_engine.get_latest_data()

    def get_event_history(self):

        return live_engine.get_event_history()


service = WorkerSafetyService()
