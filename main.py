from memory_manager import MemoryManager
from process import Process

def main():
    print("=== 🧠 Virtual Memory Simulator ===\n")

    algorithm = input("Choose page replacement algorithm (FIFO / LRU / MRU / OPTIMAL): ").strip().upper()
    if algorithm not in ["FIFO", "LRU", "MRU", "OPTIMAL"]:
        print("⚠️ Invalid choice, defaulting to FIFO.")
        algorithm = "FIFO"

    # Ask user for number of frames
    try:
        frame_count = int(input("Enter the number of frames: ").strip())
        if frame_count <= 0:
            raise ValueError
    except ValueError:
        print("⚠️ Invalid input. Using default frame count of 3.")
        frame_count = 3

    access_sequence = [0, 2, 1, 4, 0, 3, 6, 2, 4]
    reference_string = access_sequence if algorithm == "OPTIMAL" else None

    memory_manager = MemoryManager(algorithm_name=algorithm, frame_count=frame_count, reference_string=reference_string)
    process = Process(memory_manager)

    print(f"\nAlgorithm in use: {algorithm}")
    print(f"Number of frames: {frame_count}")
    print(f"Page access sequence: {access_sequence}\n")

    if not access_sequence:
        print("⚠️ Access sequence is empty. No simulation performed.")
        return

    try:
        total_faults = process.simulate(access_sequence)
    except Exception as e:
        print(f"❌ Error during simulation: {e}")
        return

    frames_after = memory_manager.replacement.get_frames() if hasattr(memory_manager.replacement, "get_frames") else []
    page_table_state = memory_manager.page_table.get_entries() if hasattr(memory_manager.page_table, "get_entries") else []

    print("\n=== Simulation Complete ===")
    print(f"Total page faults: {total_faults}")
    print(f"Frames after simulation: {frames_after}")
    print(f"Page table state: {page_table_state}")

if __name__ == "__main__":
    main()
