module Voom
  module Presenters
    module DSL
      module Components
          class ListAction < Base
            attr_accessor :action_type

            def initialize(**attribs_, &block)
              super(type: :action, **attribs_, &block)
              expand!
            end

            def icon(icon=nil, **attribs, &block)
              return @icon if locked?
              @action_type = :icon
              @icon = Icon.new(parent: self, icon: icon,
                               context: context,
                               **attribs, &block)
            end


            def menu(**attribs, &block)
              return @menu if locked?
              @action_type = :menu
              @menu = Menu.new(parent: self, context: context,
                               **attribs, &block)
            end
            
            def checkbox(**attribs, &block)
               return @checkbox if locked?
               @action_type = :checkbox
               @checkbox = Checkbox.new(parent:self, context: context,
                                        **attribs, &block)
             end

             def radio_button(**attribs, &block)
               return @radio_button if locked?
               @action_type = :radio_button
               @radio_button = RadioButton.new(parent: self, context: context,
                                               **attribs, &block)
             end

             def switch(**attribs, &block)
               return @switch if locked?
               @action_type = :switch
               @switch = Switch.new(parent: self, context: context,
                                    **attribs, &block)
             end

             def icon_toggle(icon=nil, **attribs, &block)
               return @icon_toggle if locked?
               @action_type = :icon_toggle
               @icon_toggle = IconToggle.new(parent:self, icon: icon, context: context,
                                             **attribs, &block)
             end
          end
        end
      end
    end
  end
