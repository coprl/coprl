module Coprl
  module Presenters
    module DSL
      module Components
        class RichTextArea < TextField
          attr_reader :placeholder, :height, :resizable, :img_compression,
                      :img_max_width, :img_max_height, :server_upload_path

          def initialize(**attribs_, &block)
            super(type: :rich_text_area, **attribs_, &block)
            @placeholder = attribs.delete(:placeholder)
            @rows = attribs.delete(:rows) || default(:rows)
            @height = "#{@rows * 24}px"
            @resizable = attribs.delete(:resizable) { false }
            @links = attribs.delete(:links) { true }
            @images = attribs.delete(:images) { true }
            @videos = attribs.delete(:videos) { true }
            @img_compression = attribs.delete(:img_compression) { 0.7 }
            @img_max_width = attribs.delete(:img_max_width) { 1000 }
            @img_max_height = attribs.delete(:img_max_height) { 1000 }
            @server_upload_path = attribs.delete(:server_upload_path) || default(:server_upload_path)
            expand!
          end

          def toolbar_options
            {link: @links,
             image: @images,
             video: @videos}
          end
        end
      end
    end
  end
end
