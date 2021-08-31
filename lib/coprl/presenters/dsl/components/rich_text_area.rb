module Coprl
  module Presenters
    module DSL
      module Components
        class RichTextArea < TextField
          attr_reader :placeholder, :height, :resizable

          def initialize(**attribs_, &block)
            super(type: :rich_text_area, **attribs_, &block)
            @placeholder = attribs.delete(:placeholder)
            @rows = attribs.delete(:rows) || default(:rows)
            @height = "#{@rows * 24}px"
            @resizable = attribs.delete(:resizable) { false }
            @links = attribs.delete(:links) { true }
            @images = attribs.delete(:images) { true }
            @videos = attribs.delete(:videos) { true }
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
