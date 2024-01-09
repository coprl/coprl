module Coprl
  module Presenters
    module DSL
      module Components
        module Actions
          class RunScript < Actions::Base
            def initialize(**attribs_, &block)
              super(type: :run_script, **attribs_, &block)
            end
          end
        end
      end
    end
  end
end
