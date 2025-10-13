# main.py

from memory_manager import MemoryManager
from process import Process

def main():
    mm = MemoryManager()
    proc = Process(mm)

    print("=== Virtual Memory Analyser ===")
    access_sequence = [0, 2, 1, 4, 0, 3, 6, 2, 4]
    proc.access_pages(access_sequence)

if __name__ == "__main__":
    main()
