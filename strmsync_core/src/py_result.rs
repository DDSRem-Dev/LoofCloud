use pyo3::prelude::*;

use crate::py_info::{DownloadInfo, FailInfo, SkipInfo, StrmInfo};

#[pyclass]
pub struct PackedResult {
    #[pyo3(get)]
    pub strm_results: Vec<StrmInfo>,
    #[pyo3(get)]
    pub download_results: Vec<DownloadInfo>,
    #[pyo3(get)]
    pub fail_results: Vec<FailInfo>,
    #[pyo3(get)]
    pub skip_results: Vec<SkipInfo>,
}
