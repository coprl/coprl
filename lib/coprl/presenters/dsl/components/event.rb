module Coprl
  module Presenters
    module DSL
      module Components
        class Event < Base
          include Mixins::LastResponse

          attr_accessor :event, :actions

          def initialize(**attribs_, &block)
            super(type: :event, **attribs_, &block)

            @event = alias_event(attribs.delete(:event))
            @actions = []

            expand!
          end

          def <<(comp)
            @actions << comp
          end

          def loads(presenter = nil, path: nil, target: nil, input_tag: nil, wait_for_download: nil, **params, &block)
            self << Actions::Loads.new(parent: self,
                                       presenter: presenter,
                                       path: path,
                                       target: target,
                                       input_tag: input_tag,
                                       wait_for_download: wait_for_download,
                                       params: params, &block)
          end
          alias load loads

          def replaces(target, presenter, input_tag: nil, ignore_input_values: [], **params, &block)
            self << Actions::Replaces.new(parent: self,
                                          target: target,
                                          presenter: presenter,
                                          input_tag: input_tag,
                                          ignore_input_values: Array(ignore_input_values),
                                          params: params, &block)
          end
          alias replace replaces

          def posts(path, input_tag: nil, headers: nil, **params, &block)
            self << Actions::Posts.new(parent: self,
                                       path: path,
                                       input_tag: input_tag,
                                       headers: headers,
                                       params: params, &block)
          end
          alias post posts
          alias creates posts
          alias create posts

          def updates(path, input_tag: nil, headers: nil, **params, &block)
            self << Actions::Updates.new(parent: self,
                                         path: path,
                                         input_tag: input_tag,
                                         headers: headers,
                                         params: params, &block)
          end
          alias update updates

          def deletes(path, input_tag: nil, headers: nil, **params, &block)
            self << Actions::Deletes.new(parent: self,
                                         path: path,
                                         input_tag: input_tag,
                                         headers: headers,
                                         params: params, &block)
          end
          alias delete deletes

          def dialog(dialog_id, **params, &block)
            self << Actions::Dialog.new(parent: self,
                                        target: dialog_id,
                                        params: params, &block)
          end

          def toggle_visibility(component_id, **params, &block)
            self << Actions::ToggleVisibility.new(parent: self,
                                                  target: component_id,
                                                  params: params, &block)
          end

          def show(component_id, **params, &block)
            toggle_visibility(component_id, **params.merge(action: :show), &block)
          end

          def hide(component_id, **params, &block)
            toggle_visibility(component_id, **params.merge(action: :hide), &block)
          end

          def toggle_disabled(component_id = nil, **params, &block)
            if component_id.nil? && params[:selector].nil?
              raise ArgumentError "Must specify an ID as the first parameter or pass a CSS selector in the params hash"
            end

            self << Actions::ToggleDisabled.new(parent: self,
                                                target: component_id,
                                                params: params, &block)
          end

          def disable(component_id = nil, **params, &block)
            toggle_disabled(component_id, **params.merge(action: :disable), &block)
          end

          def enable(component_id, **params, &block)
            toggle_disabled(component_id, **params.merge(action: :enable), &block)
          end

          def prompt_if_dirty(dialog_id, input_tag: nil, **params, &block)
            self << Actions::PromptIfDirty.new(parent: self,
                                               target: dialog_id,
                                               input_tag: input_tag,
                                               params: params, &block)
          end

          # Removes the component and all its children
          # Takes either an id or a list of ids.
          def remove(*ids, **params, &block)
            self << Actions::Remove.new(parent: self,
                                        params: params.merge(ids: ids), &block)
          end
          alias removes remove

          def snackbar(text, **params, &block)
            self << Actions::Snackbar.new(parent: self,
                                          params: params.merge(text: text), &block)
          end

          def autocomplete(path, **params, &block)
            @actions << Actions::Autocomplete.new(parent: self,
                                                  type: :autocomplete,
                                                  path: path,
                                                  target: "#{parent(:text_field).id}-list",
                                                  params: params, &block)
          end

          def navigates(direction, **params, &block)
            self << Actions::Navigates.new(parent: self,
                                           params: params.merge(direction: direction), &block)
          end
          alias navigate navigates

          # Clears or blanks out a control or form.
          # Takes either an id or a list of ids.
          # If the id is that of a form then all the clearable inputs on the form will be cleared.
          def clear(*ids, **params, &block)
            self << Actions::Clear.new(parent: self,
                                       params: params.merge(ids: ids), &block)
          end
          alias clears clear

          def close_dialog(component_id, **params, &block)
            self << Actions::CloseDialog.new(parent: self,
                                             target: component_id,
                                             params: params, &block)
          end

          def post_message(msg, **params, &block)
            self << Actions::PostMessage.new(parent: self,
                                             params: params.merge(message: msg), &block)
          end

          def stepper(navigate, **params, &block)
            self << Actions::Stepper.new(parent: self,
                                         params: params.merge(navigate: navigate, stepper_id: parent(:stepper).id), &block)
          end

          def parallel(&block)
            self << Actions::ParallelGroup.new(parent: self, &block)
          end

          def dispatch_event(name, from: nil)
            self << Actions::DispatchEvent.new(parent: self, params: {name: name, from: from})
          end

          def run_script(script)
            self << Actions::RunScript.new(parent: self, params: {script: script})
          end

          private

          # Alias common event names
          EVENT_MAP = {
            focus: :focusin,
            blur: :focusout,
            onload: :after_init
          }.freeze

          def alias_event(event)
            EVENT_MAP.fetch(event.to_sym) {event.to_sym}
          end

          def initialize_plugins
            self.class.include_plugins(:DSLEventActions, :DSLHelpers, plugins: _plugins_)
          end

          def _plugins_
            @parent.send(:_plugins_) if @parent
          end
        end
      end
    end
  end
end
