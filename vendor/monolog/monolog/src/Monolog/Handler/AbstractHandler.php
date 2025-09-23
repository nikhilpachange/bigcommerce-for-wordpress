<?php

namespace App\Logging;

use Monolog\Formatter\FormatterInterface;
use Monolog\Formatter\LineFormatter;
use Monolog\Logger;
use Monolog\ResettableInterface;

/**
 * BaseLoggerHandler
 *
 * Abstract base class for log handlers. Defines the core
 * handler structure including level filtering, bubbling,
 * formatters, and processors.
 */
abstract class BaseLoggerHandler implements HandlerContract, ResettableInterface
{
    /** @var int */
    protected $minLevel = Logger::DEBUG;

    /** @var bool */
    protected $allowBubble = true;

    /** @var FormatterInterface|null */
    protected $formatter;

    /** @var callable[] */
    protected $processors = [];

    /**
     * @param int|string $level  Minimum log level
     * @param bool       $bubble Allow messages to propagate?
     */
    public function __construct($level = Logger::DEBUG, bool $bubble = true)
    {
        $this->setLevel($level);
        $this->allowBubble = $bubble;
    }

    /**
     * Check if this handler should handle the given record.
     */
    public function shouldHandle(array $record): bool
    {
        return $record['level'] >= $this->minLevel;
    }

    /**
     * Process a batch of log records.
     */
    public function handleBatch(array $records): void
    {
        foreach ($records as $record) {
            $this->handle($record);
        }
    }

    /**
     * Override in concrete handlers for cleanup.
     */
    public function close(): void
    {
        // default: no-op
    }

    /**
     * Add a processor to the stack.
     */
    public function addProcessor(callable $processor): static
    {
        array_unshift($this->processors, $processor);
        return $this;
    }

    /**
     * Remove the most recently added processor.
     */
    public function removeProcessor(): callable
    {
        if (!$this->processors) {
            throw new \LogicException('Processor stack is empty.');
        }

        return array_shift($this->processors);
    }

    /**
     * Assign a custom formatter.
     */
    public function setFormatter(FormatterInterface $formatter): static
    {
        $this->formatter = $formatter;
        return $this;
    }

    /**
     * Get the formatter (creates default if none is set).
     */
    public function getFormatter(): FormatterInterface
    {
        return $this->formatter ??= $this->getDefaultFormatter();
    }

    /**
     * Configure minimum log level.
     */
    public function setLevel(int|string $level): static
    {
        $this->minLevel = Logger::toMonologLevel($level);
        return $this;
    }

    /**
     * Retrieve minimum log level.
     */
    public function getLevel(): int
    {
        return $this->minLevel;
    }

    /**
     * Configure bubbling behavior.
     */
    public function setBubble(bool $bubble): static
    {
        $this->allowBubble = $bubble;
        return $this;
    }

    /**
     * Check bubbling behavior.
     */
    public function getBubble(): bool
    {
        return $this->allowBubble;
    }

    /**
     * Destructor to ensure handler is closed gracefully.
     */
    public function __destruct()
    {
        try {
            $this->close();
        } catch (\Throwable $e) {
            // ignore errors during shutdown
        }
    }

    /**
     * Reset handler and its processors.
     */
    public function reset(): void
    {
        foreach ($this->processors as $p) {
            if ($p instanceof ResettableInterface) {
                $p->reset();
            }
        }
    }

    /**
     * Default formatter for handlers.
     */
    protected function getDefaultFormatter(): FormatterInterface
    {
        return new LineFormatter();
    }
}
