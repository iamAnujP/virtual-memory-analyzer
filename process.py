# process.py

class Process:
    def __init__(self, memory_manager):
        self.memory_manager = memory_manager

    def access_pages(self, sequence):
        for page in sequence:
            self.memory_manager.access_page(page)
