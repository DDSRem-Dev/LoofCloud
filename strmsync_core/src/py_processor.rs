use pyo3::prelude::*;

use crate::config::ProcessConfig;
use crate::item::BatchItem;
use crate::process::process_batch_impl;
use crate::py_info::{DownloadInfo, FailInfo, SkipInfo, StrmInfo};
use crate::py_result::PackedResult;

#[pyclass]
pub struct Processor {
    pub(crate) config: ProcessConfig,
}

#[pymethods]
impl Processor {
    #[new]
    fn new(config_json: &str) -> PyResult<Self> {
        let config: ProcessConfig = serde_json::from_str(config_json).map_err(|e| {
            pyo3::exceptions::PyValueError::new_err(format!("config JSON 解析失败: {}", e))
        })?;
        Ok(Processor { config })
    }

    /// Process one batch of file items. Returns PackedResult with strm_results, download_results, fail_results, skip_results.
    fn process_batch(&self, batch_json: &str) -> PyResult<PackedResult> {
        let items: Vec<BatchItem> = serde_json::from_str(batch_json).map_err(|e| {
            pyo3::exceptions::PyValueError::new_err(format!("batch JSON 解析失败: {}", e))
        })?;
        let r = process_batch_impl(&self.config, &items);
        Ok(PackedResult {
            strm_results: r
                .strm_results
                .into_iter()
                .map(|s| StrmInfo {
                    path_in_pan: s.path_in_pan,
                    pickcode: s.pickcode,
                    original_file_name: s.original_file_name,
                })
                .collect(),
            download_results: r
                .download_results
                .into_iter()
                .map(|d| DownloadInfo {
                    path_in_pan: d.path_in_pan,
                    pickcode: d.pickcode,
                    sha1: d.sha1,
                })
                .collect(),
            fail_results: r
                .fail_results
                .into_iter()
                .map(|f| FailInfo {
                    path_in_pan: f.path_in_pan,
                    reason: f.reason,
                })
                .collect(),
            skip_results: r
                .skip_results
                .into_iter()
                .map(|s| SkipInfo {
                    path_in_pan: s.path_in_pan,
                    reason: s.reason,
                })
                .collect(),
        })
    }
}
