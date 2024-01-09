module Coprl
  module Presenters
    module DSL
      module Components
        module Actions
          class DispatchEvent < Actions::Base
            def initialize(**attribs_, &block)
              super(type: :dispatch_event, **attribs_, &block)
            end
          end
        end
      end
    end
  end
end
