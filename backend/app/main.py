from app.core.config import cfg
from app.startup import create_server, run_reload, setup_signal_handlers

if __name__ == "__main__":
    if cfg.app.debug:
        run_reload()
    else:
        Server = create_server()
        setup_signal_handlers(Server)
        Server.run()
