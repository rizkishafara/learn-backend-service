from flask import Flask, jsonify
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


if __name__ == "__main__":
    app.run(debug=True)
