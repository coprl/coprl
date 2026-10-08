module Coprl
  module Presenters
    module DSL
      module Components
        module Mixins
          module Header
            def header(title = nil, **attributes, &block)
              return @header if locked?

              @header = Components::Header.new(
                parent: self,
                **attributes,
                &block
              )
              self << @header
            end
          end
        end
      end
    end
  end
end
