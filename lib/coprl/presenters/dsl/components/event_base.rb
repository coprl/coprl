module Coprl
  module Presenters
    module DSL
      module Components
        # @deprecated
        # All Components now support events and no longer need to explicitly
        # inherit from EventBase.
        class EventBase < Base
          def initialize(**attribs_, &block)
            super(type: :icon, **attribs_, &block)
          end
        end
      end
    end
  end
end
