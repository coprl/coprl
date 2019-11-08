module Voom
  module Presenters
    module DSL
      module Components
        module Mixins
          module LastResponse
            # Defines a client side dynamic parameter used by an action
            # Example usage:
            #     updates forte_path, params: params
            #     updates update_portal_path(portal_id: portal.id), token: last_response.token
            class ActionParameter
              include Voom::Serializer

              attr_reader :type, :response_index, :value, :dynamic_parameter

              def initialize(index=0)
                @value = []
                @type = :action_parameter
                @response_index = index
                @dynamic_parameter = true
              end

              def type
                :action_parameter
              end

              def method_missing(name, *args, &block)
                @value << name
                self
              end

              def respond_to?(method_name, include_private = false)
                method_name == :to_hash ? false : true
              end

              def to_h
                super(false)
              end
            end

            def last_response(index=0)
              ActionParameter.new(index)
            end
          end
        end
      end
    end
  end
end
