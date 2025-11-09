from flask import Flask, render_template, jsonify, request
from memory_manager import MemoryManager
from process import Process
from config import PAGE_TABLE_SIZE

app = Flask(__name__)

# Global memory manager and process
mm = MemoryManager(algorithm_name="FIFO")  # Default algorithm
proc = Process(mm)


@app.route("/")
def index():
    """
    Render the main page.
    """
    return render_template(
        "index.html",
        page_table_size=PAGE_TABLE_SIZE,
        current_algorithm=mm.algorithm_name
    )


@app.route("/access", methods=["POST"])
def access_page():
    """
    Expect JSON: { "page": <page_number> }
    Return JSON: { "page_table", "frames", "last_accessed", "last_fault", "algorithm" }
    """
    data = request.get_json()
    page = data.get("page")

    if page is None:
        return jsonify({"error": "Missing 'page' value"}), 400

    # Simulate page access
    mm.access_page(page)

    # Return the full memory state
    return jsonify(mm.get_state() | {"last_accessed": page})


@app.route("/set_algorithm", methods=["POST"])
def set_algorithm():
    """
    Expect JSON: { "algorithm": "FIFO" | "LRU" | "MRU" | "OPTIMAL", "reference_string": [optional] }
    Switch the current page replacement algorithm.
    """
    data = request.get_json()
    algo = data.get("algorithm", "").upper()
    ref = data.get("reference_string")

    try:
        mm.set_algorithm(algo, reference_string=ref)
        return jsonify({
            "status": "ok",
            "message": f"Switched to {algo} algorithm.",
            "algorithm": algo
        })
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@app.route("/simulate", methods=["POST"])
def simulate_sequence():
    """
    Expect JSON: { "sequence": [page_numbers] }
    Runs a full sequence of page accesses and returns total page faults + final state.
    """
    data = request.get_json()
    sequence = data.get("sequence")

    if not isinstance(sequence, list):
        return jsonify({"error": "Missing or invalid 'sequence' list"}), 400

    total_faults = proc.simulate(sequence)

    return jsonify({
        "total_faults": total_faults,
        "final_state": mm.get_state(),
        "sequence": sequence
    })


if __name__ == "__main__":
    app.run(debug=True)

