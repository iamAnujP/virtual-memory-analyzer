# memory_manager.py

from replacement_algo import FIFOPageReplacement
from page_table import PageTable
from config import FRAME_COUNT, PAGE_TABLE_SIZE

class MemoryManager:
    def __init__(self):
        self.page_table = PageTable(PAGE_TABLE_SIZE)
        self.replacement = FIFOPageReplacement(FRAME_COUNT)
        self.frame_map = {}

    def access_page(self, page_number):
        print(f"\nAccessing page {page_number}...")

        if self.page_table.is_loaded(page_number):
            print(f"✅ Page {page_number} already in memory.")
        else:
            print(f"⚠️ Page fault! Loading page {page_number}.")
            fault = self.replacement.replace(page_number)

            if fault:
                # Unload if needed
                for pg, fr in self.frame_map.items():
                    if pg not in self.replacement.get_frames():
                        self.page_table.unload_page(pg)
                        del self.frame_map[pg]
                        break

            frame_number = self.replacement.get_frames().index(page_number)
            self.page_table.load_page(page_number, frame_number)
            self.frame_map[page_number] = frame_number

        self.display_state()

    def display_state(self):
        print("📄 Page Table:", self.page_table.get_entries())
        print("📦 Frames:", self.replacement.get_frames())
