fn main() {
    println!("cargo:rerun-if-changed=../public/pdf/demo.pdf");
    tauri_build::build()
}
