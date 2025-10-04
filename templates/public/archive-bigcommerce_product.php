<?php
if (!defined('ABSPATH')) exit;
get_header();
echo apply_filters('bigcommerce/template/product/archive', '');
get_footer();
