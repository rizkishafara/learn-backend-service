from flask import Flask, jsonify, request
import mysql.connector
import os

app = Flask(__name__)
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "8080"))
DB_NAME = os.getenv("DB_NAME", "backend_lab")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "")


def get_conn():
    return mysql.connector.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, database=DB_NAME
    )


@app.route("/")
def home():
    return jsonify({"message": "Halo dari Flask + MySQL"})


@app.route("/products")
def products():
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nama, harga FROM products")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows)


@app.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nama, harga FROM products WHERE id = %s", (product_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if row:
        return jsonify(row)
    return jsonify({"error": "Product not found"}), 404


@app.route("/products", methods=["POST"])
def create_product():
    data = request.get_json()
    nama = data.get("nama")
    harga = data.get("harga")

    if not nama or harga is None:
        return jsonify({"error": "nama and harga are required"}), 400

    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO products (nama, harga) VALUES (%s, %s)", (nama, harga))
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return jsonify({"id": new_id, "nama": nama, "harga": harga}), 201


@app.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    data = request.get_json()
    nama = data.get("nama")
    harga = data.get("harga")

    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({"error": "Product not found"}), 404

    cursor.execute(
        "UPDATE products SET nama = %s, harga = %s WHERE id = %s",
        (nama, harga, product_id),
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"id": product_id, "nama": nama, "harga": harga})


@app.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({"error": "Product not found"}), 404

    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": f"Product {product_id} deleted"})


if __name__ == "__main__":
    app.run(debug=True)
