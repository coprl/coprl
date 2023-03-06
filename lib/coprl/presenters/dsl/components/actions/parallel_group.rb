module Coprl
  module Presenters
    module DSL
      module Components
        module Actions
          class ParallelGroup < Components::Event
            attr_reader :parent, :actions

            def initialize(parent:, &block)
              super(type: :parallel_group, event: :parallel, parent: parent)

              @parent = parent
              @actions = evaluate_actions(&block)
            end

            private

            def evaluate_actions(&block)
              # TODO: shouldn't need to create a temporary dummy Event to evaluate actions.
              dummy = Components::Event.new(parent: self, type: :event, event: :parallel_group_event)
              dummy.instance_eval(&block)

              dummy.actions || []
            end
          end
        end
      end
    end
  end
end
