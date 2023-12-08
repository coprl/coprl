module Support
  module JSErrors
    def print_js_errors
      logs = @browser.driver.logs.get(:browser)
      errors = logs.select { |entry| entry.level == 'SEVERE' }

      if errors.any?
        raise errors.map(&:message).join($/)
      end
    end
  end
end
