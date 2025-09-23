<?php

namespace App\Autoload;

/**
 * SimpleAutoloader
 *
 * A lightweight loader for classes using PSR-0, PSR-4 and class maps.
 *
 * Example:
 *   $loader = new SimpleAutoloader();
 *   $loader->addPsr4('App\\', __DIR__ . '/src');
 *   $loader->register();
 *
 * @author You
 * @see    https://www.php-fig.org/psr/psr-0/
 * @see    https://www.php-fig.org/psr/psr-4/
 */
class SimpleAutoloader
{
    /** @var array<string, string[]> */
    private $psr4 = [];

    /** @var array<string, string[]> */
    private $psr0 = [];

    /** @var string[] */
    private $fallbackDirs = [];

    /** @var array<string, string> */
    private $classMap = [];

    /** @var bool */
    private $useIncludePath = false;

    /**
     * Register this loader with SPL.
     */
    public function register(bool $prepend = false): void
    {
        spl_autoload_register([$this, 'loadClass'], true, $prepend);
    }

    /**
     * Unregister this loader.
     */
    public function unregister(): void
    {
        spl_autoload_unregister([$this, 'loadClass']);
    }

    /**
     * Load the class if possible.
     */
    public function loadClass(string $class): ?bool
    {
        $file = $this->findFile($class);

        if ($file) {
            include $file;
            return true;
        }

        return null;
    }

    /**
     * Try to resolve a class name to a file.
     */
    public function findFile(string $class): string|false
    {
        // Check classmap first
        if (isset($this->classMap[$class])) {
            return $this->classMap[$class];
        }

        // PSR-4 lookup
        foreach ($this->psr4 as $prefix => $dirs) {
            if (str_starts_with($class, $prefix)) {
                $relative = str_replace('\\', DIRECTORY_SEPARATOR, substr($class, strlen($prefix))) . '.php';
                foreach ($dirs as $dir) {
                    $file = $dir . DIRECTORY_SEPARATOR . $relative;
                    if (file_exists($file)) {
                        return $file;
                    }
                }
            }
        }

        // PSR-0 lookup
        $logical = str_replace(['\\', '_'], DIRECTORY_SEPARATOR, $class) . '.php';
        foreach ($this->psr0 as $prefix => $dirs) {
            if (str_starts_with($class, $prefix)) {
                foreach ($dirs as $dir) {
                    $file = $dir . DIRECTORY_SEPARATOR . $logical;
                    if (file_exists($file)) {
                        return $file;
                    }
                }
            }
        }

        // Fallback dirs
        foreach ($this->fallbackDirs as $dir) {
            $file = $dir . DIRECTORY_SEPARATOR . $logical;
            if (file_exists($file)) {
                return $file;
            }
        }

        // Include path (optional)
        if ($this->useIncludePath && ($file = stream_resolve_include_path($logical))) {
            return $file;
        }

        return false;
    }

    /** Add PSR-4 namespace mapping */
    public function addPsr4(string $prefix, string|array $paths): void
    {
        $this->psr4[$prefix] = (array) $paths;
    }

    /** Add PSR-0 namespace mapping */
    public function addPsr0(string $prefix, string|array $paths): void
    {
        $this->psr0[$prefix] = (array) $paths;
    }

    /** Add fallback directory */
    public function addFallbackDir(string $path): void
    {
        $this->fallbackDirs[] = $path;
    }

    /** Add classes to the classmap */
    public function addClassMap(array $map): void
    {
        $this->classMap = array_merge($this->classMap, $map);
    }

    /** Toggle include_path usage */
    public function setUseIncludePath(bool $flag): void
    {
        $this->useIncludePath = $flag;
    }
}
<?php

namespace App\Autoload;

/**
 * SimpleAutoloader
 *
 * A lightweight loader for classes using PSR-0, PSR-4 and class maps.
 *
 * Example:
 *   $loader = new SimpleAutoloader();
 *   $loader->addPsr4('App\\', __DIR__ . '/src');
 *   $loader->register();
 *
 * @author You
 * @see    https://www.php-fig.org/psr/psr-0/
 * @see    https://www.php-fig.org/psr/psr-4/
 */
class SimpleAutoloader
{
    /** @var array<string, string[]> */
    private $psr4 = [];

    /** @var array<string, string[]> */
    private $psr0 = [];

    /** @var string[] */
    private $fallbackDirs = [];

    /** @var array<string, string> */
    private $classMap = [];

    /** @var bool */
    private $useIncludePath = false;

    /**
     * Register this loader with SPL.
     */
    public function register(bool $prepend = false): void
    {
        spl_autoload_register([$this, 'loadClass'], true, $prepend);
    }

    /**
     * Unregister this loader.
     */
    public function unregister(): void
    {
        spl_autoload_unregister([$this, 'loadClass']);
    }

    /**
     * Load the class if possible.
     */
    public function loadClass(string $class): ?bool
    {
        $file = $this->findFile($class);

        if ($file) {
            include $file;
            return true;
        }

        return null;
    }

    /**
     * Try to resolve a class name to a file.
     */
    public function findFile(string $class): string|false
    {
        // Check classmap first
        if (isset($this->classMap[$class])) {
            return $this->classMap[$class];
        }

        // PSR-4 lookup
        foreach ($this->psr4 as $prefix => $dirs) {
            if (str_starts_with($class, $prefix)) {
                $relative = str_replace('\\', DIRECTORY_SEPARATOR, substr($class, strlen($prefix))) . '.php';
                foreach ($dirs as $dir) {
                    $file = $dir . DIRECTORY_SEPARATOR . $relative;
                    if (file_exists($file)) {
                        return $file;
                    }
                }
            }
        }

        // PSR-0 lookup
        $logical = str_replace(['\\', '_'], DIRECTORY_SEPARATOR, $class) . '.php';
        foreach ($this->psr0 as $prefix => $dirs) {
            if (str_starts_with($class, $prefix)) {
                foreach ($dirs as $dir) {
                    $file = $dir . DIRECTORY_SEPARATOR . $logical;
                    if (file_exists($file)) {
                        return $file;
                    }
                }
            }
        }

        // Fallback dirs
        foreach ($this->fallbackDirs as $dir) {
            $file = $dir . DIRECTORY_SEPARATOR . $logical;
            if (file_exists($file)) {
                return $file;
            }
        }

        // Include path (optional)
        if ($this->useIncludePath && ($file = stream_resolve_include_path($logical))) {
            return $file;
        }

        return false;
    }

    /** Add PSR-4 namespace mapping */
    public function addPsr4(string $prefix, string|array $paths): void
    {
        $this->psr4[$prefix] = (array) $paths;
    }

    /** Add PSR-0 namespace mapping */
    public function addPsr0(string $prefix, string|array $paths): void
    {
        $this->psr0[$prefix] = (array) $paths;
    }

    /** Add fallback directory */
    public function addFallbackDir(string $path): void
    {
        $this->fallbackDirs[] = $path;
    }

    /** Add classes to the classmap */
    public function addClassMap(array $map): void
    {
        $this->classMap = array_merge($this->classMap, $map);
    }

    /** Toggle include_path usage */
    public function setUseIncludePath(bool $flag): void
    {
        $this->useIncludePath = $flag;
    }
}
