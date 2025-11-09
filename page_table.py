class PageTable:
    """
    Simple page table implementation.
    Tracks which pages are loaded in which frames.
    """

    def __init__(self, size):
        """
        Initialize the page table with a fixed number of entries.
        Each entry is -1 if the page is not currently loaded into memory.
        """
        self.size = size
        self.entries = [-1] * size  # -1 indicates page not loaded

    def is_loaded(self, page_number):
        """
        Check if the specified page is currently loaded in memory.
        Returns True if loaded, False otherwise.
        """
        return 0 <= page_number < self.size and self.entries[page_number] != -1

    def load_page(self, page_number, frame_number):
        """
        Mark the given page as loaded into the specified frame.
        """
        if 0 <= page_number < self.size:
            self.entries[page_number] = frame_number

    def unload_page(self, page_number):
        """
        Remove a page from memory by setting its entry to -1.
        """
        if 0 <= page_number < self.size:
            self.entries[page_number] = -1

    def clear(self):
        """
        Reset all entries to -1, effectively clearing the table.
        """
        self.entries = [-1] * self.size

    def get_entries(self):
        """
        Return the page table entries in a structured format for frontend use.
        Each entry is a dictionary with:
          - page: the page number
          - frame: the frame it is loaded into, or -1 if not loaded
          - valid: True if loaded, False otherwise
        Example output:
        [
          {"page": 0, "frame": 2, "valid": True},
          {"page": 1, "frame": -1, "valid": False},
          ...
        ]
        """
        return [
            {"page": i, "frame": frame, "valid": frame != -1}
            for i, frame in enumerate(self.entries)
        ]
