module Coprl::Presenters::WebClient::Helpers
  module DragAndDrop
    def draggable_attributes(comp)
      if comp.draggable
        json = CGI.escapeHTML(comp.draggable.to_h.to_json)
        html_safe("draggable=true data-drag_params=\"#{json}\"")
      else
        ""
      end
    end

    def drop_zone_attributes(comp)
      if comp.drop_zone
        zone = comp.drop_zone[:zone]
        json = CGI.escapeHTML(comp.drop_zone.to_h.to_json)
        html_safe("data-dropzone=\"#{h zone}\" data-drop_params=\"#{json}\"")
      else
        ""
      end
    end
  end
end
