use pyo3::prelude::*;

#[pyclass]
#[derive(Clone)]
pub struct StrmInfo {
    #[pyo3(get)]
    pub path_in_pan: String,
    #[pyo3(get)]
    pub pickcode: String,
    #[pyo3(get)]
    pub original_file_name: String,
}

#[pyclass]
#[derive(Clone)]
pub struct DownloadInfo {
    #[pyo3(get)]
    pub path_in_pan: String,
    #[pyo3(get)]
    pub pickcode: String,
    #[pyo3(get)]
    pub sha1: String,
}

#[pyclass]
#[derive(Clone)]
pub struct FailInfo {
    #[pyo3(get)]
    pub path_in_pan: String,
    #[pyo3(get)]
    pub reason: String,
}

#[pyclass]
#[derive(Clone)]
pub struct SkipInfo {
    #[pyo3(get)]
    pub path_in_pan: String,
    #[pyo3(get)]
    pub reason: String,
}
