class Process:
    """
    Represents a process that generates page access requests
    and interacts with a memory manager to simulate page access.
    """

    def __init__(self, memory_manager):
        """
        Initialize the process with a reference to a memory manager.
        """
        self.memory_manager = memory_manager
        self.page_sequence = []

    def access_pages(self, sequence):
        """
        Access pages in the given sequence, one by one.
        Updates memory state through the memory manager.
        """
        self.page_sequence = sequence
        print(f"🧩 Process accessing pages: {sequence}")
        for page in sequence:
            self.memory_manager.access_page(page)

    def simulate(self, sequence):
        """
        Run a full sequence of page accesses and return
        the total number of page faults encountered.
        Useful for batch testing or frontend visualization.
        """
        self.page_sequence = sequence
        page_faults = 0
        print(f"🚀 Starting simulation for sequence: {sequence}")

        for page in sequence:
            self.memory_manager.access_page(page)
            if self.memory_manager.last_fault:
                page_faults += 1

        print(f"✅ Simulation complete. Total page faults: {page_faults}")
        return page_faults
