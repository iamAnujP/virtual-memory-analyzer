from replacement_algo import get_algorithm
from page_table import PageTable
from config import FRAME_COUNT, PAGE_TABLE_SIZE


class MemoryManager:
    def __init__(self, algorithm_name="FIFO", reference_string=None):
        """
        Initialize the memory manager.
        algorithm_name: one of ["FIFO", "LRU", "MRU", "OPTIMAL"]
        reference_string: used only for Optimal algorithm.
        """
        self.page_table = PageTable(PAGE_TABLE_SIZE)
        self.replacement = get_algorithm(algorithm_name, FRAME_COUNT, reference_string)
        self.algorithm_name = algorithm_name
        self.frame_map = {}
        self.last_fault = False  # Track if the last access caused a fault

    def set_algorithm(self, algorithm_name, reference_string=None):
        """
        Change the page replacement algorithm at runtime.
        """
        self.replacement = get_algorithm(algorithm_name, FRAME_COUNT, reference_string)
        self.algorithm_name = algorithm_name
        self.frame_map.clear()
        self.page_table.clear()  # Assuming PageTable has a clear() method
        self.last_fault = False

    def access_page(self, page_number):
        """
        Simulate accessing a page — called by Flask route.
        """
        self.last_fault = False  # Reset before each access

        # If page is already in memory → hit
        if self.page_table.is_loaded(page_number):
            pass  # Page hit, no replacement needed
        else:
            # Page fault
            self.last_fault = True
            fault = self.replacement.replace(page_number)

            # Remove any pages that were replaced
            if fault:
                for pg in list(self.frame_map.keys()):
                    if pg not in self.replacement.get_frames():
                        self.page_table.unload_page(pg)
                        del self.frame_map[pg]
                        break

            # Map new page to frame
            frame_number = self.replacement.get_frames().index(page_number)
            self.page_table.load_page(page_number, frame_number)
            self.frame_map[page_number] = frame_number

        # Return current memory state for JSON response
        return self.get_state()

    def get_state(self):
        """
        Return the current memory state (for JSON response in Flask).
        """
        return {
            "algorithm": self.algorithm_name,
            "page_table": self.page_table.get_entries(),
            "frames": self.replacement.get_frames(),
            "last_fault": self.last_fault,
        }
