# page_table.py

class PageTable:
    def __init__(self, size):
        self.entries = [-1] * size  # -1 means not loaded

    def is_loaded(self, page_number):
        return self.entries[page_number] != -1

    def load_page(self, page_number, frame_number):
        self.entries[page_number] = frame_number

    def unload_page(self, page_number):
        self.entries[page_number] = -1

    def get_entries(self):
        return self.entries
