module Coprl
  module Presenters
    module DSL
      module Components
        module Mixins
          module Header
            def header(title = nil, **attributes, &block)
              self << Components::Header.new(
                parent: self,
                **attributes,
                &block
              )
            end
          end
        end
      end
    end
  end
end
