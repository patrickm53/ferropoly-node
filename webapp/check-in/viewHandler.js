import $ from 'jquery'

class ViewHandler {
  constructor() {
    this.viewUpdateHandlers = {};
    this.views              = ['#view-dashboard', '#view-map', '#view-teamaccount', '#view-properties', '#view-pricelist'];
  }

  /**
   * Register an update handler
   * @param panel
   * @param handler
   */
  registerUpdateHandler(panel, handler) {
    this.viewUpdateHandlers[panel] = handler;
  }

  /**
   * Activate a view
   * @param v
   */
  activateView(v) {
    console.log('activate ' + v);
    for (let i = 0; i < this.views.length; i++) {
      $(this.views[i]).hide();
    }

    if (this.viewUpdateHandlers[v]) {
      this.viewUpdateHandlers[v]();
    }
    $(v).show();
  }
}

const viewHandler = new ViewHandler();

/**
 * Function called when document is ready
 */
$(document).ready(function () {
  console.log('document ready');
  //activateView('#view-pricelist');
  viewHandler.activateView('#view-dashboard');
});

function activateView(v) {
  return viewHandler.activateView(v);
}

export  {viewHandler, activateView}
