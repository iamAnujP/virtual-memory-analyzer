from flask import Flask, render_template, jsonify, request
from memory_manager import MemoryManager
from process import Process
from config import PAGE_TABLE_SIZE

app = Flask(__name__)

# create a global memory manager instance
mm = MemoryManager()
proc = Process(mm)

@app.route("/")
def index():
    # render the main page
    return render_template("index.html", page_table_size=PAGE_TABLE_SIZE)

@app.route("/access", methods=["POST"])
def access_page():
    """
    Expect JSON: { "page": <page_number> }
    Return JSON state: page table entries, frames list, last_fault (bool)
    """
    data = request.get_json()
    page = data.get("page")
    if page is None:
        return jsonify({"error": "Missing page"}), 400

    # access that page
    mm.access_page(page)
    # get current state
    state = {
        "page_table": mm.page_table.get_entries(),
        "frames": mm.replacement.get_frames(),
        "last_accessed": page
    }
    return jsonify(state)

if __name__ == "__main__":
    # debug mode for auto-reload
    app.run(debug=True)
