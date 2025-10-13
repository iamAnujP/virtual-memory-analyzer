# replacement_algo.py

class FIFOPageReplacement:
    def __init__(self, frame_count):
        self.frames = []
        self.frame_count = frame_count

    def replace(self, page_number):
        if page_number in self.frames:
            return False  # No page fault
        if len(self.frames) < self.frame_count:
            self.frames.append(page_number)
        else:
            self.frames.pop(0)
            self.frames.append(page_number)
        return True  # Page fault occurred

    def get_frames(self):
        return self.frames
