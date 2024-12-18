module Coprl
  module Presenters
    module DSL
      module Components
        module Mixins
          module Typography
            include Mixins::Append

            def headline(*text, **attributes, &block)
              self << Components::Typography.new(parent: self, type: :headline, text: text,
                                                 level: attributes[:level] || Settings.default(:headline, :level),
                                                 **attributes, &block)
            end

            def headline1(*text, **attributes, &block)
              headline(*text, level: 1, **attributes, &block)
            end

            alias heading1 headline1

            def headline2(*text, **attributes, &block)
              headline(*text, level: 2, **attributes, &block)
            end

            alias heading2 headline2

            def headline3(*text, **attributes, &block)
              headline(*text, level: 3, **attributes, &block)
            end

            alias heading3 headline3

            def headline4(*text, **attributes, &block)
              headline(*text, level: 4, **attributes, &block)
            end

            alias heading4 headline4

            def headline5(*text, **attributes, &block)
              headline(*text, level: 5, **attributes, &block)
            end

            alias heading5 headline5

            def headline6(*text, **attributes, &block)
              headline(*text, level: 6, **attributes, &block)
            end

            alias heading6 headline6


            alias heading headline
            alias display headline

            def title(*text, **attributes, &block)
              headline(text, level: attributes[:level] || Settings.default(:title, :level), **attributes, &block)
            end

            def subtitle(*text, **attributes, &block)
              self << Components::Typography.new(parent: self,
                                                 type: :subtitle,
                                                 text: text,
                                                 level: attributes[:level] || 1,
                                                 **attributes, &block)
            end

            alias subtitle1 subtitle

            def subtitle2(*text, **attributes, &block)
              subtitle(*text, level: attributes[:level] || 2, **attributes, &block)
            end

            alias subheading subtitle

            def page_title(*text, **attributes, &block)
              self << Components::PageTitle.new(parent: self, text: text, level: 1, **attributes, &block)
            end

            def body(*text, **attributes, &block)
              self << Components::Typography.new(parent: self,
                                                 type: :body,
                                                 text: text,
                                                 level: attributes[:level] || 1,
                                                 **attributes, &block)
            end

            def body2(*text, **attributes, &block)
              body(*text, level: attributes[:level] || 2, **attributes, &block)
            end

            def text(*text, **attributes, &block)
              return @text if defined? @text
              body(*text, level: attributes[:level] || 1, **attributes, &block)
            end

            def blank(**attributes, &block)
              self << Components::Typography.new(parent: self,
                                                 type: :body,
                                                 text: ['&nbsp;'],
                                                 level: attributes[:level] || 1,
                                                 **attributes, &block)
            end

            def caption(*text, **attributes, &block)
              self << Components::Typography.new(parent: self, type: :caption, text: text,
                                                 **attributes, &block)
            end

            def overline(*text, **attributes, &block)
              self << Components::Typography.new(parent: self, type: :overline, text: text,
                                                 **attributes, &block)
            end

            def separator(**attributes, &block)
              self << Components::Separator.new(parent: self, **attributes, &block)
            end

            def link(text, url, **attributes, &block)
              self << Components::Link.new(parent: self, text: text, url: url, **attributes, &block)
            end
          end
        end
      end
    end
  end
end
