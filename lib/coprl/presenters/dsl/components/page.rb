module Coprl
  module Presenters
    module DSL
      module Components
        class Page < Base
          attr_accessor :title, :header, :background_color, :theme_color

          def initialize(**attribs_, &block)
            super(type: :page, **attribs_, &block)

            @theme_color = attribs_.delete(:theme_color)

            expand!
          end

          def title(title=nil)
            return @title if locked?
            @title = title
          end

          def background_color(color=nil)
            return @background_color if locked?
            @background_color = color
          end

          def header(header=nil)
            return @header if locked?
            @header = header
          end
        end
      end
    end
  end
end
