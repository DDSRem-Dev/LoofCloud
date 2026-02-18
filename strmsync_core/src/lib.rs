mod config;
mod item;
mod process;
mod result;
mod utils;

use pyo3::prelude::*;

use config::ProcessConfig;
use item::BatchItem;
use process::process_batch_impl;

/// Process one batch of file items. Returns JSON string of PackedResult.
///
/// - config_json: ProcessConfig (pan_media_dir, rmt_mediaext, download_mediaext, min_file_size, auto_download_mediainfo, detail_log)
/// - batch_json: array of BatchItem (name, path, is_dir, size, pickcode, sha1)
#[pyfunction]
fn process_batch(config_json: &str, batch_json: &str) -> PyResult<String> {
    let config: ProcessConfig = serde_json::from_str(config_json).map_err(|e| {
        pyo3::exceptions::PyValueError::new_err(format!("config JSON 解析失败: {}", e))
    })?;
    let items: Vec<BatchItem> = serde_json::from_str(batch_json).map_err(|e| {
        pyo3::exceptions::PyValueError::new_err(format!("batch JSON 解析失败: {}", e))
    })?;
    let result = process_batch_impl(&config, &items);
    serde_json::to_string(&result).map_err(|e| {
        pyo3::exceptions::PyValueError::new_err(format!("结果序列化失败: {}", e))
    })
}

#[pyfunction]
fn __version__() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

#[pymodule]
fn strmsync_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(process_batch, m)?)?;
    m.add_function(wrap_pyfunction!(__version__, m)?)?;
    Ok(())
}
