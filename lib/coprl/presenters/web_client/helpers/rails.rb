module Coprl::Presenters::WebClient::Helpers
  # Sinatra specific helpers
  module Rails
    include Coprl::Presenters::WebClient::Helpers::Shared
    include LocalVariables
    include Partials
    include SafeMarkdown
    include Namespaced
    include Raw
    include EscapeHtml
    include TemplateHelper
  end
end
