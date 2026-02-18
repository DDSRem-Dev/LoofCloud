mod config;
mod item;
mod process;
mod py_info;
mod py_processor;
mod py_result;
mod result;
mod utils;

use pyo3::prelude::*;

use py_info::{DownloadInfo, FailInfo, SkipInfo, StrmInfo};
use py_processor::Processor;
use py_result::PackedResult;

#[pymodule]
fn strmsync_core(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_class::<Processor>()?;
    m.add_class::<PackedResult>()?;
    m.add_class::<StrmInfo>()?;
    m.add_class::<DownloadInfo>()?;
    m.add_class::<FailInfo>()?;
    m.add_class::<SkipInfo>()?;
    m.add("__version__", env!("CARGO_PKG_VERSION"))?;
    Ok(())
}
