<?php
namespace Bigcommerce\Unit\Api;

use Bigcommerce\Api\ClientError;
use PHPUnit\Framework\TestCase;

class ClientErrorTest extends TestCase
{
    public function testToString()
    {
        $this->assertSame(
            'Client Error (100): message here',
            (string) new ClientError('message here', 100)
        );
    }
}
