module Coprl
  module Presenters
    module DSL
      module Components
        module Mixins
          module Attaches
            include Namespace
            def attach(presenter, **params, &yield_block)
              @_yield_block_ = yield_block
              fq_presenter = _expand_namespace_(presenter, namespace)
              presenter = Presenters::App.registered?(fq_presenter) ? fq_presenter : presenter
              pom = Coprl::Presenters::App[presenter].call.expand_child(parent: self, context: context.merge(params))
              @components += pom.components if @components

              # many partials examine the presence of `@events`, not whether
              # it's empty, so avoid setting `@events` to `[]` if possible:
              if pom.events&.any?
                @events ||= []
                @events += pom.events
              end

              pom
            end
          end
        end
      end
    end
  end
end

