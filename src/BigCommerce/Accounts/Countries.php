<?php

namespace BigCommerce\Accounts;

class Countries {
	private $data_file;
	private $data = null;

	public function __construct($data_file) {
		$this->data_file = $data_file;
	}

	public function get_countries(): array {
		return $this->data ??= (array) json_decode(file_get_contents($this->data_file), true);
	}

	public function js_config(array $config): array {
		$config['countries'] = $this->get_countries();
		return $config;
	}
}
